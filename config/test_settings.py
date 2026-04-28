"""
Test settings — usa SQLite in-memory para rodar testes sem PostgreSQL.
Uso: python manage.py test --settings=config.test_settings
"""
import os
os.environ['DEBUG'] = 'true'

from config.settings import *  # noqa: F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]
