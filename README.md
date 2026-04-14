# Comparativa: Prisma vs TypeORM per a projectes NestJS

## 1. Filosofia i forma de treball

### Prisma
- ORM declaratiu basat en un únic fitxer: schema.prisma
- Genera automàticament migracions, tipus TS i el client de BD
- No utilitza classes ni decoradors
- Tot el model de dades està centralitzat

### TypeORM
- ORM orientat a classes: una entitat per fitxer
- Utilitza decoradors (@Entity, @Column, etc.)
- Migracions manuals o semi-automàtiques
- Model de dades distribuït en múltiples fitxers

------------------------------------------------------------

## 2. Modularitat i organització

### Prisma
Avantatges:
- Un únic fitxer facilita veure totes les relacions
- Menys dispersió i menys boilerplate
- Més ràpid de modificar quan t’hi acostumes

Inconvenients:
- Sensació inicial de “massa coses en un fitxer”
- No permet dividir models en múltiples fitxers
- Pot generar por a conflictes (encara que són rars)

### TypeORM
Avantatges:
- Cada entitat en la seua carpeta → molt modular i visual
- Familiar per a equips acostumats a Java/Hibernate
- Facilita separar responsabilitats per mòduls

Inconvenients:
- Les relacions estan disperses en diversos fitxers
- Més codi repetit i decoradors
- Més risc de desincronització entre entitats i BD

------------------------------------------------------------

## 3. Escalabilitat

### Prisma
- Escala molt bé en projectes grans (100+ models)
- Models curts i simples (5–15 línies)
- Migracions automàtiques i segures
- Tipus TS generats automàticament

### TypeORM
- Escala bé visualment (molts fitxers)
- Familiar per a equips acostumats a entitats separades
- Migracions més delicades
- Més boilerplate a mesura que creix el projecte

------------------------------------------------------------

## 4. Experiència de desenvolupament

### Prisma
- Autocompletat excel·lent
- Consultes més segures i ràpides d’escriure
- Errors més clars
- Menys codi i menys decoradors

### TypeORM
- Familiar i intuïtiu si vens d’ORMs clàssics
- Entitats separades → sensació de control
- Errors més críptics
- Més codi per a CRUDs

------------------------------------------------------------

## 5. Integració amb NestJS

### Prisma
- S’integra molt bé via PrismaService
- No utilitza repositoris, sinó un client generat
- Menys codi per a CRUDs

### TypeORM
- Integració oficial i madura
- Patró Repository molt natural en NestJS
- Més codi per a CRUDs

------------------------------------------------------------

## 6. Quan triar Prisma?

- Rapidesa de desenvolupament
- Seguretat de tipus
- Migracions automàtiques
- Menys codi i menys decoradors
- Relacions molt clares
- ORM modern i productiu

Ideal per a:
- SaaS
- APIs modernes
- Projectes que creixeran en funcionalitat

------------------------------------------------------------

## 7. Quan triar TypeORM?

- Modularitat visual (1 entitat = 1 fitxer)
- Estil clàssic i familiar
- Patrons orientats a objectes
- Control manual de migracions

Ideal per a:
- Equips acostumats a Hibernate / Java
- Projectes on la modularitat visual és prioritària

------------------------------------------------------------

## 8. Conclusió

Cap ORM és millor que l’altre. Depén de l’estil de treball de l’equip.

- Si valoreu modularitat visual i entitats separades → TypeORM
- Si valoreu rapidesa, seguretat de tipus i simplicitat → Prisma

La decisió ha de basar-se en com voleu treballar, no només en la tecnologia.



| Tema | Prisma | TypeORM |
| --- | --- | --- |
| **Filosofia** | Declaratiu, un sol fitxer | Orientat a classes, molts fitxers |
| **Modularitat** | Centralitzat (pot fer por al principi) | Altament modular i visual |
| **Migracions** | Automàtiques i segures | Manuals o semi-automàtiques |
| **Tipus TS** | Generats automàticament | Sovint manuals |
| **Codi** | Menys codi, més net | Més boilerplate |
| **Relacions** | Molt clares i explícites | Disperses entre fitxers |
| **Escalabilitat** | Molt bona (100+ models) | Bona, però més codi |
| **Integració NestJS** | Simple, via PrismaService | Oficial, via Repositories |
| **Ideal per a** | APIs modernes, SaaS | Equips que volen modularitat visual |
| **Sensació inicial** | “Tot en un fitxer” | “Tot separat i ordenat” |



<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
