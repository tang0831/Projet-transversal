# Tokana ID - Données de Test Réalistes

Voici un jeu de données de test pour vérifier toutes les fonctionnalités.

## 1. Utilisateurs (Table `utilisateur`)
| ID | Nom | Rôle | Localité |
|---|---|---|---|
| 1 | `admin_tana` | ADMIN | 1667 |
| 2 | `agent_mahanoro` | AGENT | 1694 |
| 3 | `citoyen_test` | CITOYEN | 1667 |

## 2. Citoyens (Table `Citoyen`)
| ID | Nom | Prénom | CIN | Localité |
|---|---|---|---|---|
| 1 | `RAKOTO` | Jean | 101123456789 | 1667 |
| 2 | `RASOA` | Marie | 101987654321 | 1667 |

## 3. Actes (Table `acte`)
| Type | N° Registre | Citoyen | Date |
|---|---|---|---|
| NAISSANCE | REG-2026-001 | 1 | 2026-01-15 |
| DECES | REG-2026-002 | 2 | 2026-02-20 |

## 4. Forum (Messages & Demandes)
*   **Message** : "Bonjour, je souhaite régulariser mon acte de naissance." (User: 3)
*   **Demande d'acte** : Type 'MARIAGE', Statut 'EN_ATTENTE' (User: 3)
