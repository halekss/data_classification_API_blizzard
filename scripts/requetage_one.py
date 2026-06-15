import requests as r
import csv
import pandas as pd
from config import ID_CLIENT, SECRET_CLIENT, MES_PERSONNAGES

# --- FONCTIONS ---

def obtenir_token(client_id, client_secret):
    url_token = 'https://oauth.battle.net/token'
    donnees = {'grant_type': 'client_credentials'}
    reponse = r.post(url_token, data=donnees, auth=(client_id, client_secret))
    return reponse.json().get('access_token')

def traduire_metier(nom_anglais):
    dictionnaire = {
        "Alchemy": "Alchimie", "Blacksmithing": "Forge", "Enchanting": "Enchantement",
        "Engineering": "Ingénierie", "Herbalism": "Herboristerie", "Inscription": "Calligraphie",
        "Jewelcrafting": "Joaillerie", "Leatherworking": "Travail du cuir", "Mining": "Minage",
        "Skinning": "Dépeçage", "Tailoring": "Couture"
    }
    return dictionnaire.get(nom_anglais, nom_anglais)

def extraire_texte(donnee):
    if isinstance(donnee, dict):
        return donnee.get('fr_FR', donnee.get('en_US', "Inconnu"))
    return str(donnee)

def interroger_api(token, url):
    en_tetes = {
        'Authorization': f'Bearer {token}',
        'Battlenet-Namespace': 'profile-eu',
        'Locale': 'fr_FR'
    }
    reponse = r.get(url, headers=en_tetes)
    return reponse.json() if reponse.status_code == 200 else None

# --- CONFIGURATION ET LISTE ---


token = obtenir_token(ID_CLIENT, SECRET_CLIENT)

if token:
    # Choix du chemin : manuel ou Airlfow
    nom_fichier = 'data/mon_dataset_wow.csv'
    # nom_fichier = '/opt/airflow/data/mon_dataset_wow.csv'
    
    with open(nom_fichier, mode='w', newline='', encoding='utf-8') as fichier:
        writer = csv.writer(fichier)
        writer.writerow(['Nom', 'Niveau', 'Classe', 'Race', 'iLvl', 'Métier 1', 'Métier 2'])

        for nom_p, royaume_p in MES_PERSONNAGES:
            nom_nettoye = nom_p.lower()
            base_url = f"https://eu.api.blizzard.com/profile/wow/character/{royaume_p}/{nom_nettoye}"
            
            data_p = interroger_api(token, base_url)
            
            if data_p:
                data_m = interroger_api(token, f"{base_url}/professions")
                
                nom = data_p.get('name', nom_p)
                niveau = data_p.get('level', "N/A")
                classe = extraire_texte(data_p.get('character_class', {}).get('name', "Inconnue"))
                race = extraire_texte(data_p.get('race', {}).get('name', "Inconnue"))
                ilvl = data_p.get('equipped_item_level', "N/A")

                m_liste = []
                if data_m and 'primaries' in data_m:
                    for prof in data_m['primaries']:
                        nom_brut = extraire_texte(prof.get('profession', {}).get('name', "Inconnu"))
                        m_liste.append(traduire_metier(nom_brut))

                m1 = m_liste[0] if len(m_liste) > 0 else "Aucun"
                m2 = m_liste[1] if len(m_liste) > 1 else "Aucun"

                writer.writerow([nom, niveau, classe, race, ilvl, m1, m2])
                print(f"✅ {nom} ({royaume_p}) ajouté.")
            else:
                print(f"❌ Erreur : {nom_p} sur {royaume_p} est introuvable.")

    print(f"\nTerminé ! Ton dataset contient maintenant {len(MES_PERSONNAGES)} lignes.")

    df = pd.read_csv(nom_fichier)

    df_tri_ilvl = df.sort_values(by = 'iLvl', ascending = False)

    df_tri_lvl = df_tri_ilvl.sort_values(by = 'Niveau', ascending = False)

    df_tri_lvl.to_csv(nom_fichier, index = False)

    print(f"Fichier '{nom_fichier}' mis à jour et trié avec succès !")

print(f"\nTerminé ! Ton armée de {len(MES_PERSONNAGES)} personnages est prête.")