"""
Load testing with Locust for ChatGPT Philippines
Run with: locust -f locustfile.py --users 1000 --spawn-rate 50 --host https://your-domain.com
"""

from locust import HttpUser, task, between, events
import json
import random
import time

# Sample prompts for testing
SAMPLE_PROMPTS = [
    "Write a product description for a new smartphone",
    "Create a marketing email for a summer sale",
    "Explain the benefits of cloud computing",
    "Write a blog post about SEO best practices",
    "Translate this text to Spanish: Hello, how are you?",
    "Summarize the importance of content marketing",
    "Generate social media captions for a coffee shop",
    "Write code to reverse a string in Python",
    "Create a business plan outline for a startup",
    "Explain machine learning in simple terms",
]

TOOL_ENDPOINTS = [
    "/api/tools/grammar-check",
    "/api/tools/translator",
    "/api/tools/summarizer",
    "/api/tools/paraphraser",
    "/api/tools/content-generator",
    "/api/tools/seo-analyzer",
    "/api/tools/code-generator",
    "/api/tools/email-writer",
]

class ChatUser(HttpUser):
    """Simulates a user interacting with the chat API"""

    wait_time = between(1, 5)  # Wait 1-5 seconds between tasks

    def on_start(self):
        """Initialize session for each user"""
        self.session_id = f"session_{random.randint(1000, 9999)}"
        self.messages = []

    @task(10)
    def chat_simple(self):
        """Test basic chat endpoint with simple query"""
        prompt = random.choice(SAMPLE_PROMPTS)

        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "model": "claude-3-7-sonnet-20250219"
        }

        with self.client.post(
            "/api/chat",
            json=payload,
            catch_response=True,
            name="/api/chat [simple]"
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 429:
                response.failure("Rate limited")
            else:
                response.failure(f"Got status code {response.status_code}")

    @task(5)
    def chat_conversation(self):
        """Test chat with conversation history"""
        if len(self.messages) < 2:
            # Build up conversation
            prompt = random.choice(SAMPLE_PROMPTS)
            self.messages.append({
                "role": "user",
                "content": prompt
            })
            self.messages.append({
                "role": "assistant",
                "content": "This is a test response."
            })

        # Add new message
        follow_up = "Can you explain that in more detail?"
        messages = self.messages + [{"role": "user", "content": follow_up}]

        payload = {
            "messages": messages,
            "model": "claude-3-7-sonnet-20250219"
        }

        with self.client.post(
            "/api/chat",
            json=payload,
            catch_response=True,
            name="/api/chat [conversation]"
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 429:
                response.failure("Rate limited")
            else:
                response.failure(f"Got status code {response.status_code}")

    @task(3)
    def test_tool_endpoint(self):
        """Test AI tool endpoints"""
        endpoint = random.choice(TOOL_ENDPOINTS)

        payload = {
            "text": "This is a sample text for testing the AI tool functionality.",
            "options": {}
        }

        with self.client.post(
            endpoint,
            json=payload,
            catch_response=True,
            name=f"{endpoint} [tool]"
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 429:
                response.failure("Rate limited")
            else:
                response.failure(f"Got status code {response.status_code}")

    @task(1)
    def check_health(self):
        """Check health endpoint"""
        with self.client.get(
            "/api/health",
            catch_response=True,
            name="/api/health"
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Health check failed with {response.status_code}")

    @task(1)
    def view_homepage(self):
        """Load homepage"""
        self.client.get("/", name="Homepage")


class HeavyUser(HttpUser):
    """Simulates heavy usage with large prompts"""

    wait_time = between(2, 8)

    @task
    def chat_heavy(self):
        """Test with large prompt"""
        # Generate large prompt (simulating document processing)
        large_prompt = "Please analyze the following text: " + (" ".join(SAMPLE_PROMPTS) * 20)

        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": large_prompt
                }
            ],
            "model": "claude-sonnet-4-20250514"  # Use more powerful model
        }

        with self.client.post(
            "/api/chat",
            json=payload,
            catch_response=True,
            timeout=60,  # Longer timeout for heavy requests
            name="/api/chat [heavy]"
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 429:
                response.failure("Rate limited")
            else:
                response.failure(f"Got status code {response.status_code}")


class BurstUser(HttpUser):
    """Simulates burst traffic patterns"""

    wait_time = between(0.1, 1)

    @task
    def rapid_requests(self):
        """Send rapid requests to test rate limiting"""
        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": "Quick test"
                }
            ]
        }

        with self.client.post(
            "/api/chat",
            json=payload,
            catch_response=True,
            name="/api/chat [burst]"
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 429:
                # Expected behavior for burst traffic
                response.success()
            else:
                response.failure(f"Got status code {response.status_code}")


# Custom event handlers for detailed logging
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print("Load test starting...")
    print(f"Target host: {environment.host}")

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("Load test completed!")
    print(f"Total requests: {environment.stats.total.num_requests}")
    print(f"Total failures: {environment.stats.total.num_failures}")
    print(f"Average response time: {environment.stats.total.avg_response_time:.2f}ms")
    print(f"Requests per second: {environment.stats.total.total_rps:.2f}")
