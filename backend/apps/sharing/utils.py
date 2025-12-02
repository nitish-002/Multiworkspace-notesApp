from .models import ShareLinkAccess

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_user_agent(request):
    return request.META.get('HTTP_USER_AGENT', '')

def log_share_link_access(share_link, request, email=''):
    ShareLinkAccess.objects.create(
        share_link=share_link,
        accessed_by_email=email,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request)
    )
