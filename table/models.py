from django.db import models

# Create your models here.

class Tables(models.Model):
    name = models.CharField(max_length=10)
    def __unicode__(self):
        return self.name
    #enddef
#endclass

