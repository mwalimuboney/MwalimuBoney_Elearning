import os
try:
    from django.contrib.gis.gdal import HAS_GDAL
    print(f"GDAL Found: {HAS_GDAL}")
except Exception as e:
    print(f"Error: {e}")
    print("Current Path: ", os.environ['PATH'].split(';')[0]) # Check if C:\OSGeo4W\bin is first