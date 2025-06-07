import random
import datetime
import csv

# Function to simulate weather data for Mumbai
def simulate_weather_data():
    weather_conditions = ["sunny", "cloudy", "rainy", "humid"]
    return {
        "location": "Mumbai",
        "temperature": round(random.uniform(25.0, 35.0), 1),
        "weather": random.choice(weather_conditions),
        "date": datetime.datetime.now().strftime("%Y-%m-%d")
    }

# Function to simulate volunteer turnout and waste data
def simulate_event_data(beaches, num_events):
    simulated_data = []
    for _ in range(num_events):
        beach = random.choice(beaches)
        date = (datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 365))).strftime("%Y-%m-%d")
        turnout = random.randint(10, 100)
        waste_collected = random.uniform(50.0, 500.0)  # in kg
        waste_types = {
            "plastic": random.uniform(10.0, 50.0),
            "metal": random.uniform(5.0, 30.0),
            "organic": random.uniform(20.0, 100.0),
            "glass": random.uniform(5.0, 25.0),
        }
        simulated_data.append({
            "beach": beach,
            "date": date,
            "turnout": turnout,
            "waste_collected": round(waste_collected, 2),
            **{f"{waste_type}_kg": round(amount, 2) for waste_type, amount in waste_types.items()}
        })
    return simulated_data

# Function to save data to a CSV file
def save_to_csv(filename, data, headers):
    with open(filename, "w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)

# Main program
def main():
    # Simulate weather data
    weather_data = simulate_weather_data()
    print("Weather Data:", weather_data)

    # Simulate event data
    beaches = ["Juhu Beach", "Versova Beach", "Dadar Beach", "Girgaon Chowpatty"]
    num_events = 50
    simulated_event_data = simulate_event_data(beaches, num_events)

    # Define CSV headers
    headers = [
        "beach", "date", "turnout", "waste_collected", "plastic_kg", "metal_kg", "organic_kg", "glass_kg"
    ]

    # Save simulated data to a CSV file
    csv_filename = "simulated_event_data.csv"
    save_to_csv(csv_filename, simulated_event_data, headers)
    print(f"Simulated data saved to {csv_filename}")

if __name__ == "__main__":
    main()
