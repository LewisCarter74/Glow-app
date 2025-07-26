import os
import sys
import django

# Add the parent directory of the 'backend' app to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'glowapp_backend.settings')
django.setup()

from salon.models import User, Category, Service, Stylist, Appointment, Review
from django.utils import timezone
from datetime import date, time, timedelta

def seed_data():
    # Clear existing data
    Review.objects.all().delete()
    Appointment.objects.all().delete()
    Service.objects.all().delete()
    Stylist.objects.all().delete()
    Category.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()

    # Create Users
    customer1 = User.objects.create_user(email='customer1@example.com', password='password123', first_name='John', last_name='Doe', role='customer')
    customer2 = User.objects.create_user(email='customer2@example.com', password='password123', first_name='Jane', last_name='Smith', role='customer')
    
    stylist_user1 = User.objects.create_user(email='stylist1@example.com', password='password123', first_name='Alice', last_name='Williams', role='stylist')
    stylist_user2 = User.objects.create_user(email='stylist2@example.com', password='password123', first_name='Bob', last_name='Brown', role='stylist')
    stylist_user3 = User.objects.create_user(email='stylist3@example.com', password='password123', first_name='Charlie', last_name='Davis', role='stylist')

    # Create Categories
    hair = Category.objects.create(name='Hair')
    nails = Category.objects.create(name='Nails')
    beauty = Category.objects.create(name='Beauty')

    # Create Stylists
    stylist1 = Stylist.objects.create(user=stylist_user1, bio='Expert in modern haircuts and coloring.', working_hours_start=time(9,0), working_hours_end=time(17,0), image='portfolio_images/local_host.png')
    stylist1.specialties.add(hair)

    stylist2 = Stylist.objects.create(user=stylist_user2, bio='Specializes in nail art and manicures.', working_hours_start=time(10,0), working_hours_end=time(18,0), image='portfolio_images/local_host.png')
    stylist2.specialties.add(nails)

    stylist3 = Stylist.objects.create(user=stylist_user3, bio='Experienced in facials and skin care treatments.', working_hours_start=time(9,0), working_hours_end=time(16,0), image='portfolio_images/local_host.png')
    stylist3.specialties.add(beauty, hair)

    # Create Services
    # Hair
    Service.objects.create(name='Haircut', description='A stylish haircut.', price=50.00, duration_minutes=45, category=hair)
    Service.objects.create(name='Hair Coloring', description='Professional hair coloring.', price=120.00, duration_minutes=90, category=hair)
    Service.objects.create(name='Highlights', description='Beautiful highlights.', price=150.00, duration_minutes=120, category=hair)
    
    # Nails
    Service.objects.create(name='Manicure', description='A classic manicure.', price=30.00, duration_minutes=30, category=nails)
    Service.objects.create(name='Pedicure', description='A relaxing pedicure.', price=40.00, duration_minutes=45, category=nails)
    Service.objects.create(name='Nail Art', description='Custom nail art.', price=25.00, duration_minutes=30, category=nails)
    
    # Beauty
    Service.objects.create(name='Facial', description='A rejuvenating facial.', price=80.00, duration_minutes=60, category=beauty)
    Service.objects.create(name='Eyebrow Waxing', description='Professional eyebrow waxing.', price=20.00, duration_minutes=15, category=beauty)
    Service.objects.create(name='Makeup Application', description='Full makeup application.', price=75.00, duration_minutes=60, category=beauty)

    # Create Appointments
    today = timezone.now().date()
    appointment1 = Appointment.objects.create(customer=customer1, stylist=stylist1, appointment_date=today, appointment_time=time(10,0), status='completed', duration_minutes=45)
    appointment1.services.add(Service.objects.get(name='Haircut'))
    
    appointment2 = Appointment.objects.create(customer=customer2, stylist=stylist2, appointment_date=today, appointment_time=time(14,0), status='approved', duration_minutes=30)
    appointment2.services.add(Service.objects.get(name='Manicure'))
    
    appointment3 = Appointment.objects.create(customer=customer1, stylist=stylist3, appointment_date=today + timedelta(days=1), appointment_time=time(11,0), status='pending', duration_minutes=60)
    appointment3.services.add(Service.objects.get(name='Facial'))

    # Create Reviews
    Review.objects.create(appointment=appointment1, customer=customer1, stylist=stylist1, rating=5, comment='Alice did an amazing job on my haircut!')

    print("Seed data created successfully!")

if __name__ == '__main__':
    seed_data()
