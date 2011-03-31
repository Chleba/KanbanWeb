from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.ForeignKey(User, unique=True)
    avatarImg = models.ImageField(upload_to=settings.MEDIA_ROOT, height_field=None, width_field=None, max_length=100, null=True, blank=True)

'''
class Profile(models.Model):
    user = models.OneToOneField(User, verbose_name='Uzivatel')
    avatarImg = models.ImageField(upload_to=settings.MEDIA_ROOT, height_field=None, width_field=None, max_length=100, null=True, blank=True)
    def __unicode__(self):
        return self.user.username
    #enddef
    class Meta:
        verbose_name = 'profil'
        verbose_name_plural = 'profily'
    #endclass
#endclass

class Users(models.Model):
    firstName = models.CharField(max_length=20)
    lastName = models.CharField(max_length=30)
    avatarImg = models.ImageField(upload_to=settings.MEDIA_ROOT, height_field=None, width_field=None, max_length=100, null=True, blank=True)
    def __unicode__(self):
        return self.firstName+' '+self.lastName
    #enddef

    def getImgName(self):
        if self.avatartImg is not None:
            name = self.avatartImg.path.split('/')[-1:]
        else:
            name = ''
        #endif
        return name
    #enddef

#endclass
'''

