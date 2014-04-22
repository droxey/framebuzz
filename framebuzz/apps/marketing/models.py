from django.db import models

from localflavor.us.models import PhoneNumberField


class ContactRequest(models.Model):
    first_name = models.CharField('First Name', max_length=500)
    last_name = models.CharField('Last Name', max_length=500)
    email = models.EmailField('Email')
    phone = PhoneNumberField()
    company_name = models.CharField('Company Name', max_length=500,
                                    blank=True, null=True)
    title = models.CharField('Title', max_length=500, blank=True, null=True)
    date = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Contact Request'
        verbose_name_plural = 'Contact Requests'

    def __unicode__(self):
        return self.email
