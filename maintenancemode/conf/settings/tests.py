#!/usr/bin/env python
# coding: utf-8

import django
import os

TEST_ROOT = os.path.dirname(os.path.abspath(__file__))

if django.VERSION[:2] < (1, 3):
    DATABASE_ENGINE = 'sqlite3'
    DATABASE_NAME = 'testproject.db'
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }

SITE_ID = 1

TEST_TEMPLATE_DIR = \
    os.path.join(TEST_ROOT, os.pardir, os.pardir, 'tests', 'templates')

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.doc.XViewMiddleware',
    'maintenancemode.middleware.MaintenanceModeMiddleware',
)

ROOT_URLCONF = 'maintenancemode.conf.urls.tests'

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django_jenkins',
    'maintenancemode',
)

JENKINS_TASKS = (
    'django_jenkins.tasks.run_pyflakes',
    'django_jenkins.tasks.run_pep8',
    'django_jenkins.tasks.with_coverage',
    'django_jenkins.tasks.django_tests',
)
