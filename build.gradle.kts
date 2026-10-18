plugins {
    application
    alias(libs.plugins.spotless)
}

group = "dev.manosliod"
version = "0.1.0" // x-release-please-version

repositories {
    mavenCentral()
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

sourceSets {
    main {
        java.setSrcDirs(listOf("src"))
    }
}

dependencies {
    testImplementation(platform(libs.junit.bom))
    testImplementation(libs.junit.jupiter)
    testImplementation(libs.assertj.core)
    testRuntimeOnly(libs.junit.platform.launcher)
}

application {
    mainClass = "battleship.BattleShip"
}

tasks.withType<JavaCompile>().configureEach {
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
    options.encoding = "UTF-8"
}

tasks.test {
    useJUnitPlatform()
}

spotless {
    java {
        target("src/**/*.java")
        palantirJavaFormat(libs.versions.palantir.get())
        removeUnusedImports()
        trimTrailingWhitespace()
        endWithNewline()
    }
}
