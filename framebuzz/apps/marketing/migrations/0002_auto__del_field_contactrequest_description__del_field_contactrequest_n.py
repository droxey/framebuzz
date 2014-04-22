# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'ContactRequest.description'
        db.delete_column(u'marketing_contactrequest', 'description')

        # Deleting field 'ContactRequest.name'
        db.delete_column(u'marketing_contactrequest', 'name')

        # Adding field 'ContactRequest.first_name'
        db.add_column(u'marketing_contactrequest', 'first_name',
                      self.gf('django.db.models.fields.CharField')(max_length=500, null=True, blank=True),
                      keep_default=False)

        # Adding field 'ContactRequest.last_name'
        db.add_column(u'marketing_contactrequest', 'last_name',
                      self.gf('django.db.models.fields.CharField')(max_length=500, null=True, blank=True),
                      keep_default=False)

        # Adding field 'ContactRequest.phone'
        db.add_column(u'marketing_contactrequest', 'phone',
                      self.gf('localflavor.us.models.PhoneNumberField')(max_length=20, null=True, blank=True),
                      keep_default=False)

        # Adding field 'ContactRequest.company_name'
        db.add_column(u'marketing_contactrequest', 'company_name',
                      self.gf('django.db.models.fields.CharField')(max_length=500, null=True, blank=True),
                      keep_default=False)

        # Adding field 'ContactRequest.title'
        db.add_column(u'marketing_contactrequest', 'title',
                      self.gf('django.db.models.fields.CharField')(max_length=500, null=True, blank=True),
                      keep_default=False)


        # Changing field 'ContactRequest.email'
        db.alter_column(u'marketing_contactrequest', 'email', self.gf('django.db.models.fields.EmailField')(max_length=75, null=True))

    def backwards(self, orm):

        # User chose to not deal with backwards NULL issues for 'ContactRequest.description'
        raise RuntimeError("Cannot reverse this migration. 'ContactRequest.description' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ContactRequest.name'
        raise RuntimeError("Cannot reverse this migration. 'ContactRequest.name' and its values cannot be restored.")
        # Deleting field 'ContactRequest.first_name'
        db.delete_column(u'marketing_contactrequest', 'first_name')

        # Deleting field 'ContactRequest.last_name'
        db.delete_column(u'marketing_contactrequest', 'last_name')

        # Deleting field 'ContactRequest.phone'
        db.delete_column(u'marketing_contactrequest', 'phone')

        # Deleting field 'ContactRequest.company_name'
        db.delete_column(u'marketing_contactrequest', 'company_name')

        # Deleting field 'ContactRequest.title'
        db.delete_column(u'marketing_contactrequest', 'title')


        # User chose to not deal with backwards NULL issues for 'ContactRequest.email'
        raise RuntimeError("Cannot reverse this migration. 'ContactRequest.email' and its values cannot be restored.")

    models = {
        u'marketing.contactrequest': {
            'Meta': {'object_name': 'ContactRequest'},
            'company_name': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'date': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'phone': ('localflavor.us.models.PhoneNumberField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['marketing']