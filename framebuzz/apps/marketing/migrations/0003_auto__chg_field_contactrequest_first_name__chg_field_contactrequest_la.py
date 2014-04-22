# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'ContactRequest.first_name'
        db.alter_column(u'marketing_contactrequest', 'first_name', self.gf('django.db.models.fields.CharField')(default='FirstName', max_length=500))

        # Changing field 'ContactRequest.last_name'
        db.alter_column(u'marketing_contactrequest', 'last_name', self.gf('django.db.models.fields.CharField')(default='LastName', max_length=500))

        # Changing field 'ContactRequest.phone'
        db.alter_column(u'marketing_contactrequest', 'phone', self.gf('localflavor.us.models.PhoneNumberField')(default='512-111-1111', max_length=20))

        # Changing field 'ContactRequest.email'
        db.alter_column(u'marketing_contactrequest', 'email', self.gf('django.db.models.fields.EmailField')(default='test@test.com', max_length=75))

    def backwards(self, orm):

        # Changing field 'ContactRequest.first_name'
        db.alter_column(u'marketing_contactrequest', 'first_name', self.gf('django.db.models.fields.CharField')(max_length=500, null=True))

        # Changing field 'ContactRequest.last_name'
        db.alter_column(u'marketing_contactrequest', 'last_name', self.gf('django.db.models.fields.CharField')(max_length=500, null=True))

        # Changing field 'ContactRequest.phone'
        db.alter_column(u'marketing_contactrequest', 'phone', self.gf('localflavor.us.models.PhoneNumberField')(max_length=20, null=True))

        # Changing field 'ContactRequest.email'
        db.alter_column(u'marketing_contactrequest', 'email', self.gf('django.db.models.fields.EmailField')(max_length=75, null=True))

    models = {
        u'marketing.contactrequest': {
            'Meta': {'object_name': 'ContactRequest'},
            'company_name': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'date': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'phone': ('localflavor.us.models.PhoneNumberField', [], {'max_length': '20'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['marketing']