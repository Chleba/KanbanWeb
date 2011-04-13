from django.conf.urls.defaults import *
#from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    # (r'^kanban/', include('client.tests.SimpleTest')),

    #news
    (r'^news/$', 'kanban.news.views.index'),

    #pokus
    (r'^time/', 'kanban.pokus.views.curTime'),

    ( r'^$', 'kanban.login.views.main_page' ),

    #login / logout
    ( r'^login/$', 'django.contrib.auth.views.login' ),
    ( r'^logout/$', 'kanban.login.views.logout_page' ),
    ( r'^profile/$', 'kanban.users.views.profile' ),
    ( r'^profile/edit/$', 'kanban.users.views.edit' ),

    #tabulky kanbanu
    ( r'^kanban/$', 'kanban.tickets.views.index' ),
    ( r'^kanban/tododevel/(?P<ticket_id>\d+)/$', 'kanban.tickets.views.movetododevel' ),
    ( r'^kanban/develdone/(?P<ticket_id>\d+)/$', 'kanban.tickets.views.movedeveldone' ),
    ( r'^kanban/addticket/$', 'kanban.tickets.views.addticket' ),
    ( r'^kanban/ticketdetail/(?P<ticket_id>\d+)/$', 'kanban.tickets.views.detail' ),
    ( r'^kanban/ticketedit/$', 'kanban.tickets.views.edit' ),
    ( r'^kanban/ticketremove/(?P<ticket_id>\d+)/$', 'kanban.tickets.views.delete' ),

    #zobrazovani grafu
    ( r'^graphs/$', 'kanban.sprints.views.index' ),
    ( r'^graphs/(?P<sprint_id>\d+)/detail/$', 'kanban.sprints.views.detail' ),

    #pokus anketa
    ( r'^polls/$', 'kanban.pokus.views.index' ),
    ( r'^polls/(?P<poll_id>\d+)/$', 'kanban.pokus.views.detail' ),
    ( r'^polls/(?P<poll_id>\d+)/results/$', 'kanban.pokus.views.results' ),
    ( r'^polls/(?P<poll_id>\d+)/vote/$', 'kanban.pokus.views.vote' ),

    # Uncomment the admin/doc line below to enable admin documentation:
    (r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the next line to enable the admin:
    (r'^admin/', include(admin.site.urls)),
    #(r'^%s(?P<path>.*)$' % settings.MEDIA_URL[1:], 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
)


