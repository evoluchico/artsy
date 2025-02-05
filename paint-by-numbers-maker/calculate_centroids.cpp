#include <opencv4/opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <fstream>
#include <sstream>
#include <string>
#include <omp.h>

cv::Mat readSmallPatches(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        throw std::runtime_error("Could not open file");
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

std::vector<cv::Point> calculateCentroids(const cv::Mat& small_patches) {
    std::vector<cv::Point> centroids;
    int num_labels = *std::max_element(small_patches.begin<int>(), small_patches.end<int>()) + 1;
    
    #pragma omp parallel for
    for (int label = 1; label < num_labels; ++label) {
        cv::Mat mask = (small_patches == label);
        cv::Moments m = cv::moments(mask, true);
        if (m.m00 != 0) {
            int cX = static_cast<int>(m.m10 / m.m00);
            int cY = static_cast<int>(m.m01 / m.m00);

            #pragma omp critical
            centroids.push_back(cv::Point(cX, cY));
        }
    }
    
    return centroids;
}

void saveCentroids(const std::vector<cv::Point>& centroids, const std::string& output_path) {
    std::ofstream out_file(output_path);
    if (!out_file.is_open()) {
        std::cerr << "Error opening file for writing: " << output_path << std::endl;
        return;
    }

    for (size_t i = 0; i < centroids.size(); ++i) {
        out_file << "Patch " << i + 1 << " centroid: (" << centroids[i].x << ", " << centroids[i].y << ")" << std::endl;
    }

    out_file.close();
}

int main() {
    std::string input_file_path = "small_patches.txt";
    std::string output_file_path = "centroids_output.txt";

    try {
        // Read small patches from file
        cv::Mat small_patches = readSmallPatches(input_file_path);

        // Calculate centroids
        std::vector<cv::Point> centroids = calculateCentroids(small_patches);

        // Save centroids to output file
        saveCentroids(centroids, output_file_path);

        std::cout << "Centroids saved to " << output_file_path << std::endl;
    } catch (const std::exception& ex) {
        std::cerr << "Error: " << ex.what() << std::endl;
        return -1;
    }

    return 0;
}
