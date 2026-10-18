plugins {
    application
    alias(libs.plugins.spotless)
    alias(libs.plugins.teavm)
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

dependencies {
    testImplementation(platform(libs.junit.bom))
    testImplementation(libs.junit.jupiter)
    testImplementation(libs.assertj.core)
    testRuntimeOnly(libs.junit.platform.launcher)
}

teavm {
    js {
        mainClass = "dev.manosliod.battleship.engine.Engine"
        moduleType = org.teavm.gradle.api.JSModuleType.ES2015
        targetFileName = "battleship-engine.js"
        obfuscated = true
    }
}

application {
    mainClass = "dev.manosliod.battleship.app.Main"
}

configurations.annotationProcessor {
    exclude(group = "org.teavm", module = "teavm-extension-annotation-processor")
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
