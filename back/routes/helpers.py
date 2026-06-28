import os
from PIL import Image

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image(file):
    try:
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return False, 'La imagen es demasiado grande. El tamaño máximo es 5MB.'
        
        if file_size == 0:
            return False, 'El archivo está vacío.'
        
        # Try to open and verify with PIL
        try:
            file.seek(0)
            img = Image.open(file)
            
            # Verify the format is supported
            img_format = img.format
            if img_format and img_format.lower() not in ['png', 'jpeg', 'gif', 'webp']:
                return False, 'El archivo no es una imagen válida. Solo se permiten PNG, JPG, GIF o WEBP.'
            
            # Verify that it's actually an image (this will raise an exception if corrupt)
            img.verify()
            
            # Reset file pointer and reopen for dimension check (verify() makes image unusable)
            file.seek(0)
            img = Image.open(file)
            width, height = img.size
            file.seek(0)
            
            if width > 4000 or height > 4000:
                return False, 'La imagen es demasiado grande. Las dimensiones máximas son 4000x4000 píxeles.'
            
            if width < 50 or height < 50:
                return False, 'La imagen es demasiado pequeña. Las dimensiones mínimas son 50x50 píxeles.'
            
        except Exception as e:
            return False, 'El archivo de imagen está corrupto o es inválido.'
        
        return True, None
        
    except Exception as e:
        return False, f'Error al validar la imagen: {str(e)}'
