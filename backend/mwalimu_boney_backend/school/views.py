from rest_framework import viewsets
from .models import Department
from .serializers import DepartmentSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        # Allow filtering by school_id as requested by our Angular service
        school_id = self.request.query_params.get('school_id')
        if school_id:
            return self.queryset.filter(school_id=school_id)
        return self.queryset