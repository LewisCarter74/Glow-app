
from celery import shared_task
from .models import Style, Stylist
import random

@shared_task
def get_style_recommendation(preferences: str, image_data: bytes = None):
    """
    This is a placeholder for the actual AI style recommendation logic.
    It returns a list of style recommendations based on the provided preferences.
    """
    # In a real implementation, you would use a machine learning model
    # to find styles that match the prompt and/or image.
    
    # For now, we'll just return a random selection of 5 styles.
    all_styles = list(Style.objects.all())
    if len(all_styles) > 5:
        recommended_styles = random.sample(all_styles, 5)
    else:
        recommended_styles = all_styles

    recommendations = []
    for style in recommended_styles:
        # Try to find a stylist who specializes in the style's category
        specialist = Stylist.objects.filter(specialties=style.category).order_by('?').first()

        recommendations.append({
            "description": style.description,
            "imageUrl": style.image.url if style.image else "",
            "specialistId": specialist.id if specialist else None,
        })
        
    return recommendations
