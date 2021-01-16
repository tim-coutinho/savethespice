from aws_cdk.aws_amplify import App, CustomRule, GitHubSourceCodeProvider
from aws_cdk.core import Construct, SecretValue, Stack

from cdk.secrets import savethespice_oauth_token


class SaveTheSpiceStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        app = App(
            self,
            "savethespice_amplify_app",
            app_name="SaveTheSpice",
            source_code_provider=GitHubSourceCodeProvider(
                owner="tim-coutinho",
                repository="savethespice",
                oauth_token=SecretValue(savethespice_oauth_token),
            ),
        )

        app.add_branch("amplify")
        app.add_custom_rule(CustomRule.SINGLE_PAGE_APPLICATION_REDIRECT)
