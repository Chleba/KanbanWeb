from kanban.table.models import Tables
from django.contrib import admin
'''
class UsersInline(admin.TabularInline):
    model = Users
    extra = 1
#endclass
'''
'''
class TicketsInline(admin.TabularInline):
    model = Tickets
    fieldsets = [
        (None, {'fields' : ('users', 'service', 'description')}),
        ('Dates', {'classes' : ('collapse',), 'fields' : ('pub_date', 'devel_date', 'done_date') }),
    ]
    extra = 1
#endclass
'''
class TablesAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, { 'fields' : ['name'] }),
    ]
    #list_display = ('service', 'pub_date', 'was_published_today')
    list_filter = ['name']
    #search_fields = ['name']
#endclass

admin.site.register(Tables, TablesAdmin)

