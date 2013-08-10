from django.conf import settings
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.contrib.auth import logout
from forms import DashboardSignupForm, LoginForm #, DashboardLoginForm
from django.shortcuts import redirect
from allauth.account.views import login as accountlogin
from django.contrib.auth.decorators import login_required

@login_required
def index(request):
#    if not request.user.is_authenticated():
#        return redirect('/dashboard/register/?next=%s' % request.path)
    return render_to_response('dashboard/publisher/index.html')

	
@login_required
def publisher(request):
    return render_to_response('dashboard/publisher/index.html')

	
@login_required
def videos(request):
    return render_to_response('dashboard/video/index.html')

@login_required
def videos_fbvideo(request):
    return render_to_response('dashboard/video/fbuzz_video.html')


@login_required
def moderators(request):
    return render_to_response('dashboard/moderator/index.html')

@login_required
def moderators_basic(request):
    return render_to_response('dashboard/moderator/basic.html')

@login_required
def moderators_advanced(request):
    return render_to_response('dashboard/moderator/advanced.html')


#def analytics(request):
#    return render_to_response('dashboard/analytics/index.html')


@login_required
def profile(request):
    return render_to_response('dashboard/profile/index.html')
    
@login_required
def settings(request):
    return render_to_response('dashboard/profile/settings.html')


def logout_dashboard(request):
    logout(request)  
    return redirect('/dashboard/register/?next=/dashboard/')

def login(request):
    ret = accountlogin(request=request)
    if request.method == 'POST': # If the form has been submitted...
        redirect_path = request.POST.get('next', None)
    else:
        redirect_path = request.GET.get('next', None)
    if not redirect_path:
        redirect_path = '/dashboard/'
    if not request.user.is_authenticated():
        return redirect('/dashboard/register/?errorlogin=y', RequestContext(request, {'next' : redirect_path}))
    else:
        return ret

def registerUser(request):
    if request.method == 'POST': # If the form has been submitted...
        userForm = DashboardSignupForm(data=request.POST, request=request) # A form bound to the POST data
        redirect_path = request.POST.get('next', None)
        if userForm.is_valid(): # All validation rules pass
            # Process the data in form.cleaned_data
            userForm.save()
    else:
        userForm = DashboardSignupForm(request=request) # An unbound form
        redirect_path = request.GET.get('next', None)
    if not redirect_path:
        redirect_path = '/dashboard/'
    return render_to_response('account/new_signup.html', RequestContext(request, {'reg_user_form' : userForm, 'form': LoginForm, 'next' : redirect_path}))
