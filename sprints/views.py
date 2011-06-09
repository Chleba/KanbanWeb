from datetime import datetime, date, timedelta
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from kanban.sprints.models import Sprints
from kanban.tickets.models import Tickets
from kanban.table.models import Tables
from django.contrib.auth.models import User
from django.db.models import Q

def index(req):
    sprints = Sprints.objects.order_by('date_to')
    return render_to_response('sprints/index.html', { 'sprints' : sprints, })
#enddef

def browse(req, sprint_id):
    sprint = Sprints.objects.get(pk=int(sprint_id))
    users = User.objects.all()
    tables = Tables.objects.all()
    logUser = req.user
    tickets = Tickets.objects.filter( Q(pub_date__lte=sprint.date_to) & (Q(devel_date__isnull=True) | Q(devel_date__lte=sprint.date_to, devel_date__gte=sprint.date_from)) & (Q(done_date__isnull=True) | Q(done_date__lte=sprint.date_to, done_date__gte=sprint.date_from)) )
    '''
    Ulozeni jednotlivych dnu prochazejiciho sprintu pro vypisovani do selectu a jeho jednoduche prepinani
    '''
    sprintDates = []
    df = sprint.date_from
    while df <= sprint.date_to:
        sprintDates.append(df)
        df = df+timedelta(days=1)
    #endwhile

    todo = []
    devel = []
    done = []

    if 'date' in req.GET:
        getDate = req.GET['date'].split('.')
        actualDate = date(int(getDate[2]), int(getDate[1]), int(getDate[0]))
        '''
        Ulozeni ticketu do jednotlivych sloupcu
        '''
        for t in tickets:
            if t.pub_date.date() <= actualDate and (t.devel_date is None or t.devel_date.date() > actualDate):
                todo.append(t)
            #endif
            if t.devel_date is not None and t.devel_date.date() == actualDate and t.done_date.date() > actualDate:
                devel.append(t)
            #endif
            if t.done_date is not None and (t.done_date.date() == actualDate or t.done_date.date() < actualDate):
                done.append(t)
            #endif
        #endfor

    else:
        actualDate = sprint.date_from
        for t in tickets:
            if t.pub_date.date() <= sprint.date_from.date() and (t.devel_date is None or t.devel_date.date() > sprint.date_from.date()):
                todo.append(t)
            #endif
            if t.devel_date is not None and t.devel_date.date() == sprint.date_from.date() and t.done_date.date() > sprint.date_from.date():
                devel.append(t)
            #endif
            if t.done_date is not None and t.done_date.date() == sprint.date_from.date():
                done.append(t)
            #endif
        #endfor

    return render_to_response('sprints/browse.html', {
        'todo' : todo,
        'devel' : devel,
        'done' : done,
        'tables' : tables,
        'users' : users,
        'loguser' : logUser,
        'sprint' : sprint,
        'sprintDates' : sprintDates,
        'actualDate' : actualDate,
    }, context_instance = RequestContext(req))

#enddef

def detail(req, sprint_id):
    sprint = Sprints.objects.get(pk=sprint_id)
    if sprint.date_to > datetime.now():
        '''
        # Prave probihajici sprint
        '''
        tickets = Tickets.objects.filter( Q(done_date__isnull=True) | Q(done_date__lte=sprint.date_to, done_date__gt=sprint.date_from))
        dates = []
        todo = []
        devel = []
        done = []
        #for i in xrange(sprint.date_from.toordinal(), sprint.date_to.toordinal()+1):
        df = sprint.date_from
        addday = timedelta(days=1)
        while df <= sprint.date_to:
            todo_value = 0
            devel_value = 0
            done_value = 0
            if df.date() == date.today():
                break;
            else:
                if df.isoweekday() not in (6, 7):
                    dates.append(df)
                    for item in tickets:
                        if item.done_date is not None and item.done_date <= df:
                            done_value = done_value+1
                        #endif
                        if item.devel_date is not None and item.devel_date <= df:
                            devel_value = devel_value+1
                        #endif
                        if item.pub_date <= df and item.done_date is None and item.devel_date is None:
                            todo_value = todo_value+1
                        #endif
                    #endfor
                    done.append(done_value)
                    devel.append(done_value+devel_value)
                    todo.append(done_value+devel_value+todo_value)
                else:
                    pass
                #endif
            #endif
            df = df+addday
        #endwhile
    else:
        '''
        # Predchozi sprinty
        '''
        tickets = Tickets.objects.filter( Q(pub_date__lte=sprint.date_to) & (Q(devel_date__isnull=True) | Q(devel_date__lte=sprint.date_to, devel_date__gte=sprint.date_from)) & (Q(done_date__isnull=True) | Q(done_date__lte=sprint.date_to, done_date__gte=sprint.date_from)) )
        dates = []
        todo = []
        devel = []
        done = []
        df = sprint.date_from
        addday = timedelta(days=1)
        while df <= sprint.date_to:
            todo_value = 0
            devel_value = 0
            done_value = 0
            if df.isoweekday() not in (6,7):
                dates.append(df)
                for item in tickets:
                    if item.done_date is not None and item.done_date <= df:
                        done_value = done_value+1
                    #endif
                    if item.devel_date is not None and item.devel_date <= df:
                        devel_value = devel_value+1
                    #endif
                    if item.pub_date <= df:
                        todo_value = todo_value+1
                    #endif
                #endfor
                done.append(done_value)
                devel.append(devel_value)
                todo.append(todo_value)
            else:
                done.append(done[len(done)-1])
                devel.append(devel[len(devel)-1])
                todo.append(todo[len(todo)-1])
            #endif
            df = df+addday
            if df.date() == sprint.date_to.date():
                break;
            #endif
        #endwhile
    #endif

    return render_to_response('sprints/detail.html', {
        'sprint' : sprint,
        'tickets' : tickets,
        'dates' : dates,
        'done' : done,
        'devel' : devel,
        'todo' : todo,
    })
#enddef

