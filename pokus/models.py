from django.db import models
import datetime

# Create your models here.

class Poll(models.Model):
    question = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date_published')

    def __unicode__(self):
        return self.question
    #enddef

    def was_published_today(self):
        return self.pub_date.date() == datetime.date.today()
    #enddef
    was_published_today.short_description = 'Published today ?'

#endclass

class Choise(models.Model):
    poll = models.ForeignKey(Poll)
    choise = models.CharField(max_length=200)
    votes = models.IntegerField()

    def __unicode__(self):
        return self.choise
    #enddef

#endclass

