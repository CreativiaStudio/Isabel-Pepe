import os
from PIL import Image
from rembg import remove
import numpy as np

base_dir = r"c:\Users\mario\Progetti Antigravity\isabel-pepe"
packaging_path = os.path.join(base_dir, "Generazione foto", "Packaging.jpg")
bg_path = os.path.join(base_dir, "Generazione foto", "Riferimento sfondo", "Sfondo.png")
output_path = os.path.join(base_dir, "public", "Products", "Orecchini_Riviere_packaging.png")

def process():
    print("Loading packaging image...")
    pkg_img = Image.open(packaging_path)
    
    # Optionally downscale to speed up rembg if it's too large
    pkg_img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
    
    print("Removing background...")
    # Convert PIL to bytes
    import io
    img_byte_arr = io.BytesIO()
    pkg_img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()
    
    # Remove bg
    out_bytes = remove(img_bytes)
    fg_img = Image.open(io.BytesIO(out_bytes)).convert("RGBA")
    
    print("Loading background...")
    bg_img = Image.open(bg_path).convert("RGBA")
    
    # Create a 1:1 square background (e.g., 1024x1024)
    target_size = (1024, 1024)
    bg_resized = bg_img.resize(target_size, Image.Resampling.LANCZOS)
    
    # Resize foreground to fit well inside the background (e.g. 90% of width/height)
    max_fg_size = (int(target_size[0] * 0.9), int(target_size[1] * 0.9))
    fg_img.thumbnail(max_fg_size, Image.Resampling.LANCZOS)
    
    # Center the foreground on the background
    x = (target_size[0] - fg_img.width) // 2
    y = (target_size[1] - fg_img.height) // 2
    
    bg_resized.paste(fg_img, (x, y), fg_img)
    
    # Save as PNG
    bg_resized.save(output_path, "PNG")
    print(f"Saved composed image to {output_path}")

if __name__ == "__main__":
    process()
