# -*- coding: utf-8 -*-

# Create your views here
from django.contrib.auth.decorators import login_required
from datetime import datetime
from django.shortcuts import  render_to_response, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.core.urlresolvers import reverse
from django.template import RequestContext
from kanban.table.models import Tables
#from kanban.users.models import Users
from django.contrib.auth.models import User
from kanban.tickets.models import Tickets
from kanban.sprints.models import Sprints

def httpParser(url):
    url1 = url.split('http://')
    if len(url1) > 1:
        return 'http://'+url1[1]
    else:
        return 'http://'+url1[0]
    #endif
#enddef

@login_required
def index(req):
    tables = Tables.objects.all()
    users = User.objects.all()
    for u in users:
        try:
            u.avatarImg = u.get_profile().avatarImg
        except:
            u.avatarImg = ''
        #endtry
    #endfor
    logUser = req.user
    sprint = Sprints.objects.filter(date_from__lte=datetime.now()).filter(date_to__gt=datetime.now())
    '''
    je-li nejaky sprint ve kterem muzeme kanbanovat
    '''
    if len(sprint) > 0:
        sprint_dates = { 'from' : sprint[0].date_from, 'to' : sprint[0].date_to, }
        for tab in tables:
            if tab.name == 'TODO':
                todo = Tickets.objects.filter(tables=tab)
                for t in todo:
                    for u in t.users.all():
                        try:
                            t.avatarImg = u.get_profile().avatarImg
                        except:
                            t.avatarImg = ''
                        #endtry
                    #endfor
                #endfor
            #endif
            if tab.name == 'DEVEL':
                devel = Tickets.objects.filter(tables=tab)
                for t in devel:
                    for u in t.users.all():
                        try:
                            t.avatarImg = u.get_profile().avatarImg
                        except:
                            t.avatarImg = ''
                        #endtry
                    #endfor
                #endfor
            #endif
            if tab.name == 'DONE':
                done = Tickets.objects.filter(tables=tab).filter(done_date__gt=sprint_dates['from'])
                for t in done:
                    for u in t.users.all():
                        try:
                            t.avatarImg = u.get_profile().avatarImg
                        except:
                            t.avatarImg = ''
                        #endtry
                    #endfor
                #endfor
            #endif
        #endfor
        return render_to_response('tickets/index.html', {
            'todo' : todo,
            'devel' : devel,
            'done' : done,
            'tables' : tables,
            'users' : users,
            'loguser' : logUser,
        }, context_instance = RequestContext(req))
    else:
        '''
        nejni-li zadny kanban vyhodim error hlasku
        '''
        last_sprint = Sprints.objects.all()[:1][0]
        return render_to_response('tickets/index.html', {
            'error_message' : 'Neni vytvoren zadny sprint.',
            'last_sprint' : last_sprint,
        })
    #endif

#enddef

@login_required
def movetododevel(req, ticket_id):
    logUser = req.user
    table = Tables.objects.filter(name='DEVEL')
    ticket = Tickets.objects.get(pk=ticket_id)

    if ticket.users.all()[0].id != logUser.id and logUser.is_superuser is False:
        doneText = '{ status : "userError", ticketId : '+ticket_id+', table : "devel" }'
        return HttpResponse(doneText)
    else:

        if ticket:
            ticket.tables = table
            ticket.devel_date = datetime.now()
            ticket.save()
            doneText = '{ status : "ok", ticketId : '+ticket_id+', table : "devel" }'
        else:
            doneText = '{ status : "error", ticketId : '+ticket_id+', table : "devel" }'
        return HttpResponse(doneText)
    #endif
#enddef

@login_required
def movedeveldone(req, ticket_id):
    logUser = req.user
    table = Tables.objects.filter(name='DONE')
    ticket = Tickets.objects.get(pk=ticket_id)

    if ticket.users.all()[0].id != logUser.id and logUser.is_superuser is False:
        doneText = '{ status : "userError", ticketId : '+ticket_id+', table : "devel" }'
        return HttpResponse(doneText)
    else:
        if ticket:
            ticket.tables = table
            ticket.done_date = datetime.now()
            ticket.save()
            doneText = '{ status : "ok", ticketId : '+ticket_id+', table : "done" }'
        else:
            doneText = '{ status : "error", ticketId : '+ticket_id+', table : "done" }'
        return HttpResponse(doneText)
    #endif
#enddef

@login_required
def addticket(req):
    tables = Tables.objects.all()
    table = Tables.objects.filter(name='TODO')
    for tab in tables:
        if tab.name == 'TODO':
            todo = Tickets.objects.filter(tables=tab)
        if tab.name == 'DEVEL':
            devel = Tickets.objects.filter(tables=tab)
        if tab.name == 'DONE':
            done = Tickets.objects.filter(tables=tab)
    service = req.POST['service']
    cmlurl = httpParser(req.POST['cmlurl'])
    difficulty = req.POST['difficulty']
    description = req.POST['description'].encode('utf-8')
    try:
        newticket = Tickets(service=service, cmlurl=cmlurl, difficulty=int(difficulty), description=description, pub_date=datetime.now())
    except (KeyError, Tickets.DoesNotExist):
        c = {
            'tables' : tables,
            'users' : users,
            'todo' : todo,
            'devel' : devel,
            'done' : done,
            'error' : 'Nepodarilo se vlozit novy ticket',
        }
        return render_to_response('tickets/index.html', c, context_instance = RequestContext(req))
    else:
        newticket.save()
        if 'user' in req.POST:
            users = req.POST.getlist('user')
            for u in users:
                user = User.objects.get(pk=int(u))
                newticket.users.add(user)
            #endfor
        #endif
        newticket.tables.add(table[0])
        newticket.save()
        return HttpResponseRedirect(reverse( 'kanban.tickets.views.index' ))
#enddef

@login_required
def edit(req):
    postData = req.POST
    user = User.objects.get(pk=postData['users'])
    table = Tables.objects.get(pk=postData['tables'])
    ticket = Tickets.objects.get(pk=postData['ticketId'])
    ticket.service = postData['service']
    ticket.cmlurl = httpParser(postData['cmlurl'])
    ticket.difficulty = postData['difficulty']
    ticket.save()
    if len(ticket.users.all()) > 0:
        ticket.users.remove(ticket.users.all()[0])
    #endif
    ticket.users.add(user)
    ticket.tables.remove(ticket.tables.all()[0])
    ticket.tables.add(table)
    ticket.save()
    return HttpResponseRedirect(reverse( 'kanban.tickets.views.index' ))
#enddef

@login_required
def detail(req, ticket_id):
    ticket = Tickets.objects.get(pk=ticket_id)
    tables = Tables.objects.all()
    users = User.objects.all()
    json = '{'\
        'ticketId : "'+str(ticket_id)+'",'\
        'service : "'+str(ticket.service)+'",'\
        'difficulty : "'+str(ticket.difficulty)+'",'\
        'cmlurl : "'+str(ticket.cmlurl)+'",'\
        'description : "'+str(ticket.description)+'",'\
        'pub_date : "'+str(ticket.pub_date)+'",'\
        'users : ['
    ic = 0
    for u in users:
        ic+=1
        json += '{ name : "'+str(u)+'", id : '+str(u.id)
        if len(ticket.users.all()) > 0:
            if u.id == ticket.users.all()[0].id:
                json += ', selected : "1"'
            #endif
        #endif
        json += ' }'
        if ic < len(users):
            json += ','
    #endfor
    json += '],'\
        'tables : ['
    ic = 0
    for t in tables:
        ic+=1
        json += '{ name : "'+str(t)+'", id : '+str(t.id)
        if t == ticket.tables.all()[0]:
            json += ', selected : "1"'
        #endif
        json += ' }'
        if ic < len(tables):
            json += ','
    #endfor
    json += ']'
    if ticket.devel_date is not None or ticket.done_date is not None:
        json += ','
    if ticket.devel_date is not None:
        json += 'devel_date : "'+str(ticket.devel_date)+'"'
    if ticket.done_date is not None:
        json += ', done_date : "'+str(ticket.done_date)+'"'
    json += '}'
    #from django.core import serializers
    #json = serializers.serialize('json', [ticket])
    return HttpResponse(json)
#enddef

