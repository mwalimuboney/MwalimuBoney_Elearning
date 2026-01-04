from rest_framework import serializers
from .models import Department

class DepartmentSerializer(serializers.ModelSerializer):
    # These fields can be calculated dynamically
    course_count = serializers.IntegerField(read_only=True, default=0)
    staff_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Department
        fields = ['id', 'school', 'name', 'head_of_department', 'description', 'course_count', 'staff_count']