from django.db import models
from django.db.models.signals import post_save
from django.core.mail import send_mail


class ContactRequest(models.Model):
    name = models.CharField('Name', max_length=500)
    email = models.EmailField('Email Address')
    description = models.TextField('Message')
    date = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Contact Request'
        verbose_name_plural = 'Contact Requests'

    def __unicode__(self):
        return self.name


def send_admin_email(sender, instance, created, **kwargs):
    subject = 'FrameBuzz: Contact Request from %s' % instance.name
    send_mail(subject, instance.description, instance.email, ['info@framebuzz.com'], fail_silently=False)

post_save.connect(send_admin_email, sender=ContactRequest, dispatch_uid="contact_send_admin_email")