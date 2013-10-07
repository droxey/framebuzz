from django.http import Http404
from django.core.urlresolvers import NoReverseMatch
from django.shortcuts import render, redirect

from .manager import manager
from .settings import MANAGEMENT_ADDRS


def handle_results(results):
    results = [x[0] for x in results if x]
    return zip(MANAGEMENT_ADDRS, results)


def management(request):
    if not request.user.is_superuser:
        try:
            return redirect('admin:index')
        except NoReverseMatch:
            raise Http404

    context = {
        'addrs': MANAGEMENT_ADDRS,
        'help': manager.run('help')[0][0],
    }

    if 'command' in request.POST:
        kwargs = dict(request.POST.items())
        command = str(kwargs.pop('command'))
        args = command.split()
        results = manager.run(*args, **kwargs) or []
        context.update({
            'command': command,
            'results': handle_results(results),
        })

    return render(request, 'varnish/management.html', context)
