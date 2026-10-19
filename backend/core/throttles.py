from rest_framework.throttling import BaseThrottle, SimpleRateThrottle


class IPThrottle(SimpleRateThrottle):
    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}


class ContactBurstThrottle(IPThrottle):
    scope = "contact_burst"


class ContactHourlyThrottle(IPThrottle):
    scope = "contact_hourly"


class LoginRateThrottle(IPThrottle):
    scope = "login"


def client_ip(request):
    return BaseThrottle().get_ident(request)
