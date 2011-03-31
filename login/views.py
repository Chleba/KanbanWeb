from django.contrib.auth import logout
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response

def main_page(req):
    return render_to_response('login/index.html')
#enddef

def logout_page(req):
    logout(req)
    return HttpResponseRedirect('/kanban')
#enddef

