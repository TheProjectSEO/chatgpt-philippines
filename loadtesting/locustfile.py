"""
Locust Load Testing Script for ChatGPT Philippines
Tests various API endpoints under load
"""

from locust import HttpUser, task, between, tag
import json
import random


class ChatGPTPhilippinesUser(HttpUser):
    wait_time = between(1, 5)  # Wait 1-5 seconds between tasks

    def on_start(self):
        """Called when a user starts"""
        self.prompts = [
            "What is the capital of the Philippines?",
            "Explain machine learning in simple terms",
            "Write a short story about Manila",
            "Translate 'Hello, how are you?' to Tagalog",
            "Summarize the benefits of AI",
            "Write a business plan for a coffee shop",
            "Check grammar: 'I goes to the store yesterday'",
            "Paraphrase: 'The quick brown fox jumps over the lazy dog'",
            "Generate a slogan for a tech startup",
            "Write an essay about climate change",
        ]

        self.models = [
            "claude-3-5-sonnet-20241022",
            "claude-3-7-sonnet-20250219",
            "claude-3-haiku-20240307",
        ]

    @task(5)
    @tag('chat')
    def chat_endpoint(self):
        """Test the main chat endpoint"""
        prompt = random.choice(self.prompts)
        model = random.choice(self.models)

        payload = {
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "model": model
        }

        with self.client.post(
            "/api/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 429:
                response.failure("Rate limited")
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(2)
    @tag('translate')
    def translate_endpoint(self):
        """Test translation endpoint"""
        payload = {
            "text": random.choice(self.prompts),
            "targetLanguage": random.choice(["Tagalog", "Cebuano", "Ilocano"])
        }

        with self.client.post(
            "/api/translate",
            json=payload,
            headers={"Content-Type": "application/json"},
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(2)
    @tag('grammar')
    def grammar_check_endpoint(self):
        """Test grammar checking endpoint"""
        payload = {
            "text": "I goes to the store yesterday and buys some apples"
        }

        with self.client.post(
            "/api/grammar-check",
            json=payload,
            headers={"Content-Type": "application/json"},
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(2)
    @tag('summarize')
    def summarize_endpoint(self):
        """Test summarization endpoint"""
        payload = {
            "text": "Artificial intelligence (AI) is intelligence demonstrated by machines, " +
                    "as opposed to natural intelligence displayed by animals including humans. " +
                    "AI research has been defined as the field of study of intelligent agents..."
        }

        with self.client.post(
            "/api/summarize",
            json=payload,
            headers={"Content-Type": "application/json"},
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(1)
    @tag('paraphrase')
    def paraphrase_endpoint(self):
        """Test paraphrasing endpoint"""
        payload = {
            "text": "The quick brown fox jumps over the lazy dog"
        }

        with self.client.post(
            "/api/paraphrase",
            json=payload,
            headers={"Content-Type": "application/json"},
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(1)
    @tag('monitoring')
    def health_check(self):
        """Test health check endpoint"""
        with self.client.get(
            "/api/monitoring/health",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Health check failed: {response.status_code}")

    @task(1)
    @tag('monitoring')
    def metrics_check(self):
        """Test metrics endpoint"""
        with self.client.get(
            "/api/monitoring/metrics?format=json",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Metrics check failed: {response.status_code}")


class StressTestUser(HttpUser):
    """High-load stress testing user"""
    wait_time = between(0.1, 0.5)  # Very short wait time

    @task
    def stress_test_chat(self):
        """Rapid-fire chat requests"""
        payload = {
            "messages": [
                {"role": "user", "content": "Quick test"}
            ],
            "model": "claude-3-haiku-20240307"
        }

        self.client.post("/api/chat", json=payload)


class PremiumUser(HttpUser):
    """Simulates premium authenticated users"""
    wait_time = between(2, 8)

    def on_start(self):
        """Simulate authentication"""
        # In real scenario, would authenticate here
        pass

    @task
    def premium_request(self):
        """Premium users make complex requests"""
        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": "Write a comprehensive business plan for a tech startup"
                }
            ],
            "model": "claude-3-7-sonnet-20250219"
        }

        self.client.post("/api/chat", json=payload)
