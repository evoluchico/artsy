#include <omp.h>
#include <opencv4/opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <map>
#include <fstream>
#include <sstream>
#include <unordered_map>

const int MIN_SIZE = 50;
const int MIN_THICKNESS = 3;

// Helper function to convert Vec3b to string
std::string vec3bToString(const cv::Vec3b& color) {
    std::ostringstream ss;
    ss << static_cast<int>(color[0]) << "," 
       << static_cast<int>(color[1]) << "," 
       << static_cast<int>(color[2]);
    return ss.str();
}

cv::Mat find_all_small_patches(const cv::Mat& image) {
    cv::Mat image_copy = image.clone();
    int rows = image.rows;
    int cols = image.cols;

    // Initialize a matrix to be filled with only the small patches
    cv::Mat all_small_patches = cv::Mat::zeros(rows, cols, CV_32S);
    int number_of_small_patches_so_far = 0;

    // Convert the image to a single channel with unique labels for each color
    std::unordered_map<std::string, int> color_map;
    int current_label = 1;

    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            cv::Vec3b color = image_copy.at<cv::Vec3b>(r, c);
            std::string color_str = vec3bToString(color);
            if (color_map.find(color_str) == color_map.end()) {
                color_map[color_str] = current_label++;
            }
        }
    }

    // Assign unique labels to each color
    cv::Mat label_image = cv::Mat::zeros(rows, cols, CV_32S);
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            cv::Vec3b color = image_copy.at<cv::Vec3b>(r, c);
            std::string color_str = vec3bToString(color);
            label_image.at<int>(r, c) = color_map[color_str];
        }
    }

    std::cout << "Total unique colors: " << color_map.size() << std::endl;

    // Identify small patches for each color
    int color_idx = 0;
    for (const auto& pair : color_map) {
        std::string color_str = pair.first;
        int color_label = pair.second;
        color_idx++;

        std::cout << "Processing color " << color_idx << "/" << color_map.size() << std::endl;

        // Create a binary mask for the current color
        cv::Mat mask = (label_image == color_label);

        // Label connected regions
        cv::Mat labeled;
        int num_features = cv::connectedComponents(mask, labeled, 8, CV_32S);

        std::cout << "Number of features for this color: " << num_features - 1 << std::endl;

        for (int label = 1; label < num_features; ++label) {
            cv::Mat region = (labeled == label);

            if( label % 100 == 0 )
                std::cout << label << '/' << num_features << std::endl;

            std::vector<std::vector<cv::Point>> contours;
            cv::findContours(region, contours, cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE);

            for (const auto& contour : contours) {
                double area = cv::contourArea(contour);
                cv::Rect bounding_box = cv::boundingRect(contour);

                if (area < MIN_SIZE || std::min(bounding_box.width, bounding_box.height) < MIN_THICKNESS) {
                    number_of_small_patches_so_far++;
                    #pragma omp parallel for
                    for (int r = 0; r < rows; ++r) {
                        for (int c = 0; c < cols; ++c) {
                            if (region.at<uchar>(r, c) > 0) {
                                all_small_patches.at<int>(r, c) = number_of_small_patches_so_far;
                            }
                        }
                    }
                }
            }
        }

        std::cout << "Color " << color_idx << " done. Total small patches so far: " << number_of_small_patches_so_far << std::endl;
    }

    return all_small_patches;
}

void save_small_patches(const cv::Mat& all_small_patches, const std::string& output_path) {
    std::ofstream out_file(output_path);
    if (!out_file.is_open()) {
        std::cerr << "Error opening file for writing: " << output_path << std::endl;
        return;
    }

    for (int r = 0; r < all_small_patches.rows; ++r) {
        for (int c = 0; c < all_small_patches.cols; ++c) {
            out_file << all_small_patches.at<int>(r, c) << " ";
        }
        out_file << std::endl;
    }

    out_file.close();
}

int main() {
    std::string input_image_path = "quantised_25.png";
    std::string output_path = "small_patches.txt";

    // Load the image
    cv::Mat image = cv::imread(input_image_path, cv::IMREAD_COLOR);
    if (image.empty()) {
        std::cerr << "Error loading image: " << input_image_path << std::endl;
        return -1;
    }

    std::cout << "Image loaded successfully. Size: " << image.cols << "x" << image.rows << std::endl;

    // Find all small patches
    cv::Mat small_patches = find_all_small_patches(image);

    // Save the output
    save_small_patches(small_patches, output_path);

    std::cout << "Small patches saved to " << output_path << std::endl;

    return 0;
}
