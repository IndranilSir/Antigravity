from PIL import Image
import os


files_to_optimize = [
    ("assets/hero_banner.png", "assets/hero_banner_optimized.png", 1200),
    ("assets/cert_iso.png", "assets/cert_iso_optimized.png", 600),
    ("assets/cert_msme.png", "assets/cert_msme_optimized.png", 600)
]

for input_path, output_path, max_width in files_to_optimize:
    try:
        if not os.path.exists(input_path):
            print(f"Skipping {input_path}, file not found.")
            continue
            
        with Image.open(input_path) as img:
            # Resize if width is greater than max_width
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Save as optimized PNG
            img.save(output_path, optimize=True)
            
            print(f"Processed {input_path}:")
            print(f"  Original size: {os.path.getsize(input_path)}")
            print(f"  Optimized size: {os.path.getsize(output_path)}")

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error processing {input_path}: {e}")

