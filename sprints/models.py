from django.db import models

# Create your models here.

class Sprints(models.Model):
    date_from = models.DateTimeField('date_from')
    date_to = models.DateTimeField('date_to')
    max_develop = models.IntegerField()

    def __unicode__(self):
        return str(self.date_from)+' - '+str(self.date_to)
    #enddef

#endclass

