import cv2
import numpy as np
import sys

img_path = 'C:/Users/mario/.gemini/antigravity/brain/047c4648-d1dc-4823-bfa8-0c39841c40dd/media__1783497954984.jpg'
img = cv2.imread(img_path)
if img is None:
    print("Image not found!")
    sys.exit(1)

h, w = img.shape[:2]

# Draw a grid 100x100
for i in range(0, w, 100):
    cv2.line(img, (i, 0), (i, h), (0, 255, 0), 1)
    cv2.putText(img, str(i), (i+5, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

for i in range(0, h, 100):
    cv2.line(img, (0, i), (w, i), (0, 255, 0), 1)
    cv2.putText(img, str(i), (5, i-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

out_path = 'C:/Users/mario/.gemini/antigravity/brain/047c4648-d1dc-4823-bfa8-0c39841c40dd/grid.jpg'
cv2.imwrite(out_path, img)
print("Grid saved to " + out_path)
