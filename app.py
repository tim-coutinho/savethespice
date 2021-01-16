#!/usr/bin/env python3

from aws_cdk import core

from cdk.savethespice_stack import SaveTheSpiceStack

app = core.App()
SaveTheSpiceStack(app, "SaveTheSpice")

app.synth()
