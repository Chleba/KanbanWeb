from django.contrib import admin
import models

class NewsTranslationInline(admin.StackedInline):
    model = models.NewsTranslation
    extra = 1
    min_num = 1
#endclass

class NewsAdmin(admin.ModelAdmin):
    list_display = ['pub_date']
    inlines = [NewsTranslationInline]
#endclass

admin.site.register(models.News, NewsAdmin)

