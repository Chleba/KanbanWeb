from kanban.pokus.models import Poll, Choise
from django.contrib import admin

class ChoiseInline(admin.TabularInline):
    model = Choise
    extra = 3
#endclass

class PollAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, { 'fields' : ['question']}),
        ('Date Information', { 'fields' : ['pub_date'], 'classes' : ['collapse'] }),
    ]
    inlines = [ChoiseInline]
    list_display = ('question', 'pub_date', 'was_published_today')
    list_filter = ['pub_date']
    search_fields = ['question']
    date_hierarchy = 'pub_date'
#endclass

admin.site.register(Poll, PollAdmin)
#admin.site.register(Choise)

