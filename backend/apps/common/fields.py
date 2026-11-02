"""
Campos cifrados en reposo (HU-22 / RNF-02 / DS-02).

`EncryptedTextField` es un `TextField` que **cifra el valor al guardarlo** (Fernet) y lo
**descifra al leerlo**, de forma transparente para el resto del código. La columna en la
base sigue siendo `text` (guarda el texto cifrado), por eso cambiar un campo existente a
este tipo no altera el esquema. Tolera valores previos sin cifrar (los devuelve tal cual).

Las claves vienen de `settings.FIELD_ENCRYPTION_KEYS` (en prod, desde Secret Manager).
"""
from cryptography.fernet import Fernet, InvalidToken, MultiFernet
from django.conf import settings
from django.db import models


def _cipher() -> MultiFernet:
    return MultiFernet([Fernet(k) for k in settings.FIELD_ENCRYPTION_KEYS])


class EncryptedTextField(models.TextField):
    def get_prep_value(self, value):
        value = super().get_prep_value(value)
        if value in (None, ""):
            return value
        return _cipher().encrypt(value.encode()).decode()

    def from_db_value(self, value, expression, connection):
        if value in (None, ""):
            return value
        try:
            return _cipher().decrypt(value.encode()).decode()
        except (InvalidToken, ValueError):
            return value  # valor histórico sin cifrar: se devuelve sin tocar
