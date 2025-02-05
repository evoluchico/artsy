# K-Means Paint-by-Numbers

## Overview
This project applies **K-Means clustering** to segment images into different color regions, implementing a "paint-by-numbers" effect. The approach involves clustering patches of an image based on their centroid colors and then reassigning colors based on the majority color within each cluster.

## Methodology
1. **Read Image Data:** The input image is divided into small patches, and their centroids are computed.
2. **Clustering:**
   - Apply **K-Means clustering** to group centroids of patches.
   - Use **HDBSCAN** to identify outliers.
3. **Color Assignment:**
   - Assign a uniform color to patches in the same cluster using the majority color in the group.
   - For outlier patches (HDBSCAN cluster -1), merge them into the majority color of surrounding pixels.
4. **Save Processed Image:** The final segmented image is saved as a `.png` file.

## Performance Considerations
- The clustering and color reassignment process in Python can be slow (~10 hours).
- A C++ implementation was tested, reducing the processing time to **30 minutes**, but some issues with color assignment were observed (e.g., unexpected yellow patches).

## Future Improvements
- Experiment with alternative clustering methods or heuristics to refine segmentation.

## Dependencies
The following Python libraries are required to run the notebook:
- `numpy`
- `scipy`
- `sklearn`
- `matplotlib`
- `hdbscan`
- `opencv-python`
