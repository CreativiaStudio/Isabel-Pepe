import cv2
import numpy as np

img = cv2.imread('C:/Users/mario/.gemini/antigravity/brain/047c4648-d1dc-4823-bfa8-0c39841c40dd/media__1783497954984.jpg')
h, w = img.shape[:2]

# The earring is on the model's left ear (right side of the image).
# Let's crop x from w/2 to w, and y from h/3 to h*2/3
crop = img[int(h*0.3):int(h*0.6), int(w*0.5):w]
cv2.imwrite('crop.jpg', crop)
