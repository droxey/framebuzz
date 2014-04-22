from django.db import models
from django.db.models.signals import post_save
from django.core.mail import send_mail
from localflavor.us.models import PhoneNumberField


class ContactRequest(models.Model):
    first_name = models.CharField('First Name', max_length=500, blank=True, null=True)
    last_name = models.CharField('Last Name', max_length=500, blank=True, null=True)
    email = models.EmailField('Email', blank=True, null=True)
    phone = PhoneNumberField(blank=True, null=True)
    company_name = models.CharField('Company Name', max_length=500, blank=True, null=True)
    title = models.CharField('Title', max_length=500, blank=True, null=True)
    date = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Contact Request'
        verbose_name_plural = 'Contact Requests'

    def __unicode__(self):
        return self.name


def send_admin_email(sender, instance, created, **kwargs):
    subject = 'FrameBuzz: Contact Request from %s' % instance.email
    send_mail(subject, instance.description, instance.email,
              ['info@framebuzz.com'], fail_silently=False)

post_save.connect(send_admin_email, sender=ContactRequest,
                  dispatch_uid="contact_send_admin_email")
