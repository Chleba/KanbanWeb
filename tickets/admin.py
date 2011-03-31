from kanban.tickets.models import Tickets
from django.contrib import admin

class TicketsAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, { 'fields' : ['tables', 'service', 'cmlurl', 'difficulty', 'description'] }),
        ('Dates published', { 'classes' : ['collapse'], 'fields' : ['devel_date', 'done_date'] }),
    ]
    list_filter = ['service']
    search_fields = ['service']
#endclass

admin.site.register(Tickets, TicketsAdmin)


