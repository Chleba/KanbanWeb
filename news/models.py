from django.db import models
from django.conf import settings
from kanban.multiling import MultilingualModel
# Create your models here.

class Language(models.Model):
    code = models.CharField(max_length=5)
    name = models.CharField(max_length=16)

    def __unicode__(self):
        return self.name
    #enddef

#endclass

class NewsTranslation(models.Model):
    language = models.ForeignKey('Language')
    name = models.CharField(max_length=250)
    text = models.TextField()
    model = models.ForeignKey('News')
#endclass

class News(MultilingualModel):
    pub_date = models.DateTimeField('date_published')
    
    class Meta:
        translation = NewsTranslation
        multilingual = ['name', 'text']
#endclass
'''
try:
    langCheck = Language.objects.all()[0]
except Exception, e:
    for lang in settings.LANGS:
        langname = Language(code=lang['prefix'], name=lang['name'])
        langname.save()
    #endfor
#endtry
'''
'''
lang_en = Language(code='en', name='English')
lang_en.save()
lang_cs = Language(code='cs', name='Czech')
lang_cs.save()
'''
