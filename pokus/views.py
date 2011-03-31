# Create your views here.

from datetime import datetime
from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.core.urlresolvers import reverse
#from django.views.decorators.csrf import csrf_protect
from django.template import RequestContext
#from django.core.context_processors import csrf
from kanban.pokus.models import Poll, Choise

def curTime(req):
    #return HttpResponse(datetime.now().strftime('%H:%M:%S'))
    return render_to_response('time.html', { 'current_time' : datetime.now() })
#enddef

def index(req):
    latest_poll_list = Poll.objects.all().order_by('-pub_date')[:5]
    return render_to_response('polls/index.html', { 'latest_poll_list' : latest_poll_list })
#enddef

def detail(req, poll_id):
    p = get_object_or_404(Poll, pk=poll_id)
    return render_to_response('polls/detail.html', { 'poll' : p }, context_instance = RequestContext(req))
#enddef

def results(req, poll_id):
    p = get_object_or_404(Poll, pk=poll_id)
    return render_to_response('polls/results.html', { 'poll':p })
#enddef

def vote(request, poll_id):
    p = get_object_or_404(Poll, pk=poll_id)
    try:
        selected_choise = p.choise_set.get(pk=request.POST['choise'])
    except (KeyError, Choise.DoesNotExist):
        c = {
            'poll' : p,
            'error_message' : 'HOVNO',
        }
        #c.update(csrf(request))
        return render_to_response('polls/detail.html', c, context_instance = RequestContext(request))
    else:
        selected_choise.votes += 1
        selected_choise.save()
        return HttpResponseRedirect(reverse('kanban.pokus.views.results', args=(p.id,)))
    #endtry
#enddef

