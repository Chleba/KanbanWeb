from kanban.sprints.models import Sprints
from django.contrib import admin

class SprintsAdmin(admin.ModelAdmin):
    fieldsets = [
        ( None, { 'fields' : ['date_from', 'date_to', 'max_develop'] } ),
    ]
    list_filter = ['date_to']
#endclass

admin.site.register(Sprints, SprintsAdmin)
