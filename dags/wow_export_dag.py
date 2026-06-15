from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

# Configuration de base
default_args = {
    'owner': 'alex',
    'depends_on_past': False,
    'start_date': datetime(2026, 2, 25),
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

# Définition de l'automate
with DAG(
    'wow_character_update',
    default_args=default_args,
    description='Mise à jour automatique du dataset WoW',
    schedule='0 19 * * *'
) as dag:

    # La tâche qui exécute ton script
    t1 = BashOperator(
        task_id='run_wow_script',
        bash_command='python /opt/airflow/scripts/requetage_one.py'
    )