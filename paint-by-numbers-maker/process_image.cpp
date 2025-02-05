#include <opencv4/opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <unordered_map>
#include <fstream>
#include <sstream>
#include <string>
#include <algorithm>
#include <omp.h>

// Helper function to read the centroids from a CSV file
std::vector<cv::Point> readCentroids(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        throw std::runtime_error("Could not open centroids file");
    }

    std::vector<cv::Point> centroids;
    std::string line;
    while (std::getline(file, line)) {
        std::stringstream ss(line);
        std::string x, y;
        std::getline(ss, x, ',');
        std::getline(ss, y, ',');
        centroids.emplace_back(std::stoi(x), std::stoi(y));
    }
    file.close();

    return centroids;
}

// Helper function to read HDBSCAN labels from a text file
std::vector<int> readLabels(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        throw std::runtime_error("Could not open labels file");
    }

    std::vector<int> labels;
    int label;
    while (file >> label) {
        labels.push_back(label);
    }
    file.close();

    return labels;
}

// Helper function to read small patches from a text file
cv::Mat readSmallPatches(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        throw std::runtime_error("Could not open small patches file");
    }

    std::vector<std::vector<int>> data;
    std::string line;
    while (std::getline(file, line)) {
        std::stringstream ss(line);
        std::vector<int> row;
        int value;
        while (ss >> value) {
            row.push_back(value);
        }
        data.push_back(row);
    }
    file.close();

    int rows = data.size();
    int cols = data[0].size();
    cv::Mat small_patches(rows, cols, CV_32S);
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            small_patches.at<int>(r, c) = data[r][c];
        }
    }
    return small_patches;
}

// Function to find the majority color in a given patch
cv::Vec3b majorityColor(const cv::Mat& image, const cv::Mat& mask) {
    std::unordered_map<int, int> color_count;
    for (int r = 0; r < mask.rows; ++r) {
        for (int c = 0; c < mask.cols; ++c) {
            if (mask.at<uchar>(r, c) > 0) {
                cv::Vec3b color = image.at<cv::Vec3b>(r, c);
                int color_int = (color[0] << 16) | (color[1] << 8) | color[2];
                color_count[color_int]++;
            }
        }
    }

    int max_count = 0;
    int majority_color_int = 0;
    for (const auto& pair : color_count) {
        if (pair.second > max_count) {
            max_count = pair.second;
            majority_color_int = pair.first;
        }
    }

    return cv::Vec3b((majority_color_int >> 16) & 0xFF, (majority_color_int >> 8) & 0xFF, majority_color_int & 0xFF);
}

// Function to update the result image with the majority color
void updateResultImage(cv::Mat& result_image, const cv::Mat& mask, const cv::Vec3b& color) {
    #pragma omp parallel for collapse(2)
    for (int r = 0; r < result_image.rows; ++r) {
        for (int c = 0; c < result_image.cols; ++c) {
            if (mask.at<uchar>(r, c) > 0) {
                result_image.at<cv::Vec3b>(r, c) = color;
            }
        }
    }
}

int main() {
    std::string input_image_path = "quantised_25.png";
    std::string centroids_file_path = "centroids_output.csv";
    std::string labels_file_path = "hdbscan_labels.txt";
    std::string small_patches_file_path = "small_patches.txt";
    std::string output_image_path = "result_image.png";

    #pragma omp parallel sections
    {
        #pragma omp section
        {
            std::cout<<"There are "<<omp_get_num_threads()<<" threads"<<std::endl;
        }
    }

    // Load the original image
    cv::Mat image = cv::imread(input_image_path, cv::IMREAD_COLOR);
    if (image.empty()) {
        std::cerr << "Error loading image: " << input_image_path << std::endl;
        return -1;
    }

    // Load centroids and HDBSCAN labels
    std::vector<cv::Point> centroids = readCentroids(centroids_file_path);
    std::vector<int> labels = readLabels(labels_file_path);
    cv::Mat small_patches = readSmallPatches(small_patches_file_path);

    // Create a copy of the original image to modify
    cv::Mat result_image = image.clone();

    // Create a dictionary to store the patches belonging to each cluster
    std::unordered_map<int, std::vector<int>> cluster_patches;
    for (size_t idx = 0; idx < labels.size(); ++idx) {
        int label = labels[idx];
        cluster_patches[label].push_back(idx + 1);
    }

    // Handle clustered patches
    std::cout << "Handling clustered patches...\n";
    #pragma omp parallel
    {
        #pragma omp single
        {
            for (auto it = cluster_patches.begin(); it != cluster_patches.end(); ++it) {
                #pragma omp task
                {
                    int cluster_id = it->first;
                    if (cluster_id != -1) {

                        cv::Mat combined_mask = cv::Mat::zeros(small_patches.size(), CV_8U);
                        for (int patch_id : it->second) {
                            combined_mask |= (small_patches == patch_id);
                        }
                        cv::Vec3b maj_color = majorityColor(result_image, combined_mask);
                        updateResultImage(result_image, combined_mask, maj_color);

                        /*
                        // Debugging output
                        #pragma omp critical
                        {
                            std::cout << "Processed cluster ID: " << cluster_id << '\t';
                            std::cout << "Majority color: " << static_cast<int>(maj_color[0]) << ", "
                                    << static_cast<int>(maj_color[1]) << ", "
                                    << static_cast<int>(maj_color[2]) << std::endl;
                        }
                        */
                    }
                }
            }
        }
    }

    // Handle outlier patches
    std::cout << "Handling outlier patches...\n";
    #pragma omp parallel for
    for (size_t idx = 0; idx < labels.size(); ++idx) {
        if (labels[idx] == -1) {
            int patch_id = idx + 1;
            cv::Mat mask = (small_patches == patch_id);
            cv::Mat dilated_mask;
            cv::dilate(mask, dilated_mask, cv::Mat(), cv::Point(-1, -1), 1, 1, 1);
            dilated_mask &= ~mask;
            cv::Vec3b maj_color = majorityColor(result_image, dilated_mask);
            updateResultImage(result_image, mask, maj_color);

            /*
            #pragma omp critical
            {
                std::cout << "Processed patch ID: " << patch_id << '\t';
                std::cout << "Majority color: " << static_cast<int>(maj_color[0]) << ", "
                        << static_cast<int>(maj_color[1]) << ", "
                        << static_cast<int>(maj_color[2]) << std::endl;
            }
            */
        }
    }

    // Save the result image
    if (!cv::imwrite(output_image_path, result_image)) {
        std::cerr << "Error saving result image to: " << output_image_path << std::endl;
        return -1;
    }

    std::cout << "Result image saved to " << output_image_path << std::endl;

    return 0;
}

// g++ -o process_image process_image.cpp `pkg-config --cflags --libs opencv4` -fopenmp 