from django.core.management.base import NoArgsCommand
from django.conf import settings
from django.contrib.auth.models import User
from templated_email import send_templated_mail


class Command(NoArgsCommand):
    help = ("Sends an email blast.")

    def handle_noargs(self, **options):
        users = User.objects.exclude(email=None)
        sent_to = []
        for user in users:
            send_templated_mail(template_name='welcome-back',
                                from_email=settings.DEFAULT_FROM_EMAIL,
                                recipient_list=user.email,
                                context={'username': user.username})
            sent_to.append(user.username)

        print '%s users received blast: %s' % (len(sent_to), ', '.join(sent_to))
