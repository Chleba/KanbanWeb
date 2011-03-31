# Create your views here
'''
from django.shortcuts import  render_to_response, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.core.urlresolvers import reverse
from django.template import RequestContext
from kanban.table.models import Tables

def index(req):
    tables = Tables.objects.all()
    todo = Tables.objects.filter(name='TODO')
    devel = Tables.objects.filter(name='DEVEL')
    done = Tables.objects.filter(name='DONE')
    todoTickets = Tickets.objects.filter(tables=todo)
    develTickets = Tickets.objects.filter(tables=devel)
    doneTickets = Tickets.objects.filter(tables=done)
    return render_to_response('table/index.html', { 'todo' : todoTickets,
            'devel' : develTickets,
            'done' : doneTickets,
            'tables' : tables,
        }
    )
#enddef
'''
