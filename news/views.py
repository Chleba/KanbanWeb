# Create your views here.

from django.http import HttpResponse
from django.conf import settings

def index(req):
    langs = ''
    for p in settings.LANGS:
        langs += 'jazyk bla %s\n' % p
    #endfor
    return HttpResponse(langs)
#enddef

