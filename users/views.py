from kanban.users.models import UserProfile
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.http import HttpResponse
from django.shortcuts import render_to_response
from kanban.users.forms import UserProfileForm

@login_required
def profile(req):
    userData = {
        'firstName' : req.user.first_name,
        'lastName' : req.user.last_name,
        'username' : req.user.username,
        'email' : req.user.email,
    }
    try:
        profile = req.user.get_profile()
        userData['avatarImg'] = profile.avatarImg
    except UserProfile.DoesNotExist:
        userData['avatarImg'] = ''
    #endtry

    return render_to_response('registration/profile.html', {
        'user' : userData,
    }, context_instance = RequestContext(req))
#enddef

def edit(req):
    user = req.user
    try:
        profile = req.user.get_profile()
    except:
        up = UserProfile(user=req.user)
        up.save()
        profile = req.user.get_profile()
    #endtry

    if req.method == 'POST':
        f = UserProfileForm(req.POST, req.FILES, instance=profile)
        if f.is_valid():
            f.save()
        user.first_name = req.POST['firstName']
        user.last_name = req.POST['lastName']
        user.email = req.POST['email']
        user.save()
    else:
        f = UserProfilForm(instance=profile)
    #endif

    userData = {
        'firstName' : user.first_name,
        'lastName' : user.last_name,
        'username' : user.username,
        'email' : user.email,
        #'avatarImg' : avatarImg,
    }
    #return HttpResponse(str(userData))
    return render_to_response('registration/profile.html', {
        'user' : userData,
        'status' : 'Zmeneno',
    }, context_instance = RequestContext(req))



'''
def edit(req):
    user = req.user
    user.first_name = req.POST['firstName']
    user.last_name = req.POST['lastName']
    user.email = req.POST['email']
    user.save()

    try:
        profile = req.user.get_profile()
        #profile.avatarImg = req.POST['avatarImg']
        profile.avatarImg = req.FILES
        avatarImg = profile.avatarImg
        profile.save()
    except UserProfile.DoesNotExist:
        #user.userprofile_set.get_or_create(avatarImg=req.POST['avatarImg'])
        user.userprofile_set.get_or_create(avatarImg=req.FILEs)
        profile = user.get_profile()
        avatarImg = profile.avatarImg
        profile.save()
    #endtry
    user.save()

    userData = {
        'firstName' : user.first_name,
        'lastName' : user.last_name,
        'username' : user.username,
        'email' : user.email,
        'avatarImg' : avatarImg,
        'av' : req.FILES,
    }
    #return HttpResponse(str(userData))
    return render_to_response('registration/profile.html', {
        'user' : userData,
        'status' : 'Zmeneno',
    }, context_instance = RequestContext(req))
        
#enddef
'''
